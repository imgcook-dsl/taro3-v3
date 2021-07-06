module.exports = function (schema, option) {
    const {_, prettier} = option;

    // imports
    const imports = [];

    // inline style
    const style = {};

    // Global Public Functions
    const utils = [];

    // Classes
    const classes = [];

    const styles = [];
    const dynamicObject = new Map();
    // 1vw = width / 100
    const _w = 750 / schema.rect.width;
    console.log("_w: ", _w);

    // 如果组件配置了属性responsive==vw，则返回true
    const isResponsiveVW = () => {
        return schema.props.responsive == "vw";
    };

    const isExpression = (value) => {
        return /^\{\{.*\}\}$/.test(value);
    };

    const toString = (value) => {
        if ({}.toString.call(value) === "[object Function]") {
            return value.toString();
        }
        if (typeof value === "string") {
            return value;
        }
        if (typeof value === "object") {
            return JSON.stringify(value, (key, value) => {
                if (typeof value === "function") {
                    return value.toString();
                } else {
                    return value;
                }
            });
        }

        return String(value);
    };

    // convert to responsive unit, such as rpx
    const parseStyle = (style) => {
        for (let key in style) {
            switch (key) {
                case "fontSize":
                case "marginTop":
                case "marginBottom":
                case "paddingTop":
                case "paddingBottom":
                case "height":
                case "top":
                case "bottom":
                case "width":
                case "maxWidth":
                case "left":
                case "right":
                case "paddingRight":
                case "paddingLeft":
                case "marginLeft":
                case "marginRight":
                case "lineHeight":
                case "borderBottomRightRadius":
                case "borderBottomLeftRadius":
                case "borderTopRightRadius":
                case "borderTopLeftRadius":
                case "borderRadius":
                    // style[key] = (parseInt(style[key]) * 100 / (_w*750)).toFixed(2) + 'vw';
                    // 如果组件配置了属性responsive==vw，那么使用vw单位.
                    if (isResponsiveVW()) {
                        style[key] =
                            ((parseInt(style[key]) * 100) / 750).toFixed(2) + "vw";
                    } else {
                        style[key] =
                            (parseInt(style[key])) + "px";
                    }
                    break;
            }
        }

        return style;
    };

    //生成build循环函数
    const makeBuildMethod = (schema, typeName) => {

        let result = [];
        if (Array.isArray(schema)) {
            schema.forEach((layer) => {
                result += generateRender(layer).xml;
            });
        }

        const functionS = `
          const build${_.upperFirst(_.camelCase(typeName))} = \(itemContent\) => {
                return (
                <View>
                  ${result}
                </View>
                )
        };`;
        methodName = `build${_.upperFirst(_.camelCase(typeName))}`;

        return {
            [methodName]: functionS
        };


    }
    // parse function, return params and content
    const parseFunction = (func) => {
        const funcString = func.toString();
        const params = funcString.match(/\([^\(\)]*\)/)[0].slice(1, -1);
        const content = funcString.slice(
            funcString.indexOf("{") + 1,
            funcString.lastIndexOf("}")
        );
        return {
            params,
            content,
        };
    };

    // 转化元素的props参数 parse layer props(static values or expression)
    const parseProps = (value, isReactNode) => {

        if (typeof value === "string") {
            if (isExpression(value)) {  //表达式{}
                if (isReactNode) {
                    return value.slice(1, -1);
                } else {
                    return value.slice(2, -2);
                }
            }

            if (isReactNode) {
                return value;
            } else {
                return `${value}`;
            }
        } else if (typeof value === "function") {
            const {params, content} = parseFunction(value);
            return `(${params}) => {${content}}`;
        }
    };

    // parse async dataSource
    const parseDataSource = (data) => {
        const name = data.id;
        const {uri, method, params} = data.options;
        const action = data.type;
        let payload = {};

        switch (action) {
            case "fetch":
                if (imports.indexOf(`import {fetch} from whatwg-fetch`) === -1) {
                    imports.push(`import {fetch} from 'whatwg-fetch'`);
                }
                payload = {
                    method: method,
                };

                break;
            case "jsonp":
                if (imports.indexOf(`import {fetchJsonp} from fetch-jsonp`) === -1) {
                    imports.push(`import jsonp from 'fetch-jsonp'`);
                }
                break;
        }

        Object.keys(data.options).forEach((key) => {
            if (["uri", "method", "params"].indexOf(key) === -1) {
                payload[key] = toString(data.options[key]);
            }
        });

        // params parse should in string template
        if (params) {
            payload = `${toString(payload).slice(0, -1)} ,body: ${
                isExpression(params) ? parseProps(params) : toString(params)
            }}`;
        } else {
            payload = toString(payload);
        }

        let result = `{
      ${action}(${parseProps(uri)}, ${toString(payload)})
        .then((response) => response.json())
    `;

        if (data.dataHandler) {
            const {params, content} = parseFunction(data.dataHandler);
            result += `.then((${params}) => {${content}})
        .catch((e) => {
          console.log('error', e);
        })
      `;
        }

        result += "}";

        return `${name}() ${result}`;
    };

    // parse condition: whether render the layer
    const parseCondition = (condition, render) => {
        if (typeof condition === "boolean") {
            return `${condition} && ${render}`;
        } else if (typeof condition === "string") {
            return `${condition.slice(2, -2)} && ${render}`;
        }
    };

    // parse loop render
    const parseLoop = (loop, loopArg, render) => {
        let data;
        let loopArgItem = (loopArg && loopArg[0]) || "item";
        let loopArgIndex = (loopArg && loopArg[1]) || "index";

        if (Array.isArray(loop)) {
            data = toString(loop);
        } else if (isExpression(loop)) {
            data = loop.slice(2, -2);
        }

        // add loop key
        const tagEnd = render.match(/^<.+?\s/)[0].length;
        // render = `${render.slice(0, tagEnd)} key={${loopArgIndex}}${render.slice(tagEnd)}`;

        // remove `this`
        const re = new RegExp(`this.${loopArgItem}`, "g");
        render = render.replace(re, loopArgItem);

        return `${data}.map((${loopArgItem}, ${loopArgIndex}) => {
      return (${render});
    })`;
    };

    const getDynamicParams = (children) => {
        let params = {};

        if (Array.isArray(children)) {
            children.forEach(schema => {
                if (_.has(schema, "smart.layerProtocol.field")) {
                    const fieldName = schema.smart.layerProtocol.field.type;
                    let value = "";
                    switch (schema.componentName) {
                        case "Text":
                            value = schema.props.text;
                            break;
                        case "Image":
                            value = schema.props.src;
                            break;
                        case "Div":
                            value = getDynamicParams(schema.children);
                            break;
                    }
                    params[_.camelCase(fieldName)] = value;

                }
                if (_.has(schema, "children")) {
                    let subParam = getDynamicParams(schema.children);
                    params = _.assignIn(params, subParam);
                }
            });
        }
        return params;
    };

//对含有loop参数的div进行渲染
    function parseLoopCode(schema,  data, methods, status) {
        const typeName = schema.smart.layerProtocol.loop.type;
        const xml = `<View class="${typeName}" ${data} >{state.${typeName}List}</View>`;
        methods = _.assignIn(methods, makeBuildMethod(schema.children, typeName));
        let params = getDynamicParams(schema.children);
        status[typeName] =[params];
        status[`${typeName}List`] = [];
        return xml;
    };

// generate render xml
    const generateRender = (schema, onIndexContext) => {
        const type = schema.componentName.toLowerCase();
        const className = schema.props && schema.props.className;
        const classString = className
            ? ` className="${_.camelCase(className)}" `
            : "";

        if (className) {
            style[_.camelCase(className)] = parseStyle(schema.props.style);
        }

        let xml;
        let data = "";
        let status = {};

        Object.keys(schema.props).forEach((key) => {
            if (["className", "style", "text", "src", "lines"].indexOf(key) === -1) {    //其他值
                data += ` ${key}={${parseProps(schema.props[key])}}`;
            }
        });
        //程序smart处理部分

        let field = _.has(schema, 'smart.layerProtocol.field');

        let loop = _.has(schema, "smart.layerProtocol.loop");
        //内部方法函数
        let methods = {};

        switch (type) {
            case "text":
                if (field) {
                    const innerText = parseProps(schema.props.text, true);
                    xml = `<Text ${classString} ${data} >{this.itemContent.${_.camelCase(
                        schema.props.className
                    )}}</Text>`;
                } else {
                    const innerText = parseProps(schema.props.text, true);
                    xml = `<Text${classString} ${data} >${innerText}</Text>`;
                }


                break;
            case "image":
                if (field) {
                    const source = parseProps(schema.props.src);
                    xml = `<Image ${classString} ${data} src={this.itemContent.${_.camelCase(
                        schema.props.className
                    )}} />`;
                } else {
                    const source = parseProps(schema.props.src);
                    xml = `<Image ${classString} ${data} src="${source}"
                    )}} />`;
                }
                break;
            case "div":
                if (schema.children && schema.children.length) {
                    if (loop) {
                        xml = parseLoopCode(schema, data, methods, status);

                    } else {
                        xml = `<View ${classString} ${data} >${transform(
                            schema.children
                        )}</View>`;
                    }

                } else {
                    xml = `<View ${classString} ${data} />`;
                }
                break;
            case "page":
                let result = "";

                if (Array.isArray(schema.children)) {
                    schema.children.forEach((layer) => {
                        let newGenerate = generateRender(layer, true);
                        result += newGenerate.xml;
                    });
                }
                xml = `<View ${classString} ${data} >${result}</View>`;

                transform(schema.children);
                break;
            case "block":
                const blockName = _.upperFirst(_.camelCase(schema.props.className));


                    if (onIndexContext) {
                        xml = `<${blockName} ${data} />`;
                    } else {
                        if (loop) {
                            xml = parseLoopCode(schema, xml, classString, data, methods, className, status);
                        }else{
                            let innerTransfer = transformDiv(schema.children);
                            xml = `<View ${classString} ${data} >${innerTransfer.xml}
                        )}</View>`;
                            methods = _.assignIn(innerTransfer.method);
                            status = _.assignIn(innerTransfer.status);
                        }


                    }

                break;
        }

        if (schema.loop) {
            xml = parseLoop(schema.loop, schema.loopArgs, xml);
        }
        if (schema.condition) {
            xml = parseCondition(schema.condition, xml);
        }
        if (schema.loop || schema.condition) {
            xml = `{${xml}}`;
        }

        return {
            xml: xml,
            method: methods,
            status: status,
        };
    };
    const initClassFunction = (functionName, stateName, listName) => {
        let initCode = `
        let data = state.${stateName};
        for (let i = 0; i < data.length; i++) {
          let itemContent = data[i];
          let item = buildStartItem(itemContent);
          state.${listName}.push(item);  
        }
        `;
        return initCode;
    };
    function customizerAssign(objValue, srcValue, key, object, source) {
        if (_.isArray(objValue)) {
            return srcValue.concat(objValue);
        }
    }
    //只处理div
    const transformDiv = (schema) => {
        let xml = "";
        let methods = {};
        let status = {};
        if (Array.isArray(schema)) {
            schema.forEach((layer) => {
                let classObject = transformDiv(layer);
                if(!_.has(methods,_.keys(classObject.method))){ //true:loop函数 ,可以跳过

                    xml += classObject.xml;
                    methods = _.assignInWith(methods,classObject.method,customizerAssign);
                }
                status = _.assignInWith(status,classObject.status,customizerAssign);
            });
        } else {
            let classObject = generateRender(schema);
            xml += classObject.xml;
            methods = classObject.method;
            status = classObject.status;
        }
        return {
            xml: xml,
            method: methods,
            status: status,
        };
    };
    let blockList = [];
// parse schema
    const transform = (schema) => {
        let result = "";
        const states = [];
        const methods = [];

        if (Array.isArray(schema)) {
            schema.forEach((layer) => {
                result += transform(layer);
            });
        } else {
            const type = schema.componentName.toLowerCase();

            if (["page", "block"].indexOf(type) !== -1) {
                // 容器组件处理: state/method/dataSource/lifeCycle/render
                let states = [];

                // 组件的states
                let renderStates = {};
                const methods = [];
                const lifeCycles = [];
                const init = [];
                const initClass = [];
                const render = [];
                if ("page" == type) {
                    render.push(`render(){ return (`);
                } else {
                    render.push(`return (`);
                }
                const blockName = _.upperFirst(_.camelCase(schema.props.className));
                if (blockList.indexOf(blockName) != -1) {  //存在重复的class模块跳出
                    return result;
                } else {
                    blockList.push(blockName);
                }
                //page的state
                if (schema.state) {
                    states.push(`state = ${toString(schema.state)}`);
                }

                if (schema.methods) {
                    Object.keys(schema.methods).forEach((name) => {
                        const {params, content} = parseFunction(schema.methods[name]);
                        methods.push(`${name}(${params}) {${content}}`);
                    });
                }

                if (schema.dataSource && Array.isArray(schema.dataSource.list)) {
                    schema.dataSource.list.forEach((item) => {
                        if (typeof item.isInit === "boolean" && item.isInit) {
                            init.push(`this.${item.id}();`);
                        } else if (typeof item.isInit === "string") {
                            init.push(
                                `if (${parseProps(item.isInit)}) { this.${item.id}(); }`
                            );
                        }
                        // methods.push(parseDataSource(item));
                    });

                    if (schema.dataSource.dataHandler) {
                        const {params, content} = parseFunction(
                            schema.dataSource.dataHandler
                        );
                        methods.push(`dataHandler(${params}) {${content}}`);
                        init.push(`this.dataHandler()`);
                    }
                }

                if (schema.lifeCycles) {
                    if (!schema.lifeCycles["_constructor"]) {
                        lifeCycles.push(
                            `constructor(props, context) { super(); ${init.join("\n")}}`
                        );
                    }

                    Object.keys(schema.lifeCycles).forEach((name) => {
                        const {params, content} = parseFunction(schema.lifeCycles[name]);

                        if (name === "_constructor") {
                            lifeCycles.push(
                                `constructor(${params}) { super(); ${content} ${init.join(
                                    "\n"
                                )}}`
                            );
                        } else {
                            lifeCycles.push(`${name}(${params}) {${content}}`);
                        }
                    });
                }
                let newGenerate = generateRender(schema, false);
                render.push(newGenerate.xml);
                renderStates = _.assignInWith(renderStates, newGenerate.status,customizerAssign);
                //混合method
                Object.keys(newGenerate.method).forEach(methodName => {
                    methods.push(newGenerate.method[methodName]);
                    let type = _.lowerFirst(methodName.match(/build([^\s]+)/)[1]);
                    let initCode = `
                        let data = state.${type};
                        for (let i = 0; i < data.length; i++) {
                          let itemContent = data[i];
                          let item = ${methodName}(itemContent);
                          state.${type}List.push(item);  
                        }
                        `;

                    initClass.push(initCode);
                });



                let classData;
                if (type === "page") {

                    render.push(`);}`);
                    classData = [
                        `class Index extends Component {
                            constructor (props) {
                              super(props)
                              let defaultState = {};
                              this.state = Object.assign(defaultState, JSON.parse(JSON.stringify(props)));
                            }
                        `,
                    ];
                } else {

                    render.push(`);`);
                    let renderStates1 = JSON.stringify(renderStates);
                    renderStates1 = renderStates1.replace(/\"\'/g, '"');
                    renderStates1 = renderStates1.replace(/\'\"/g, '"');
                    classData = [
                        `const ${_.upperFirst(
                            _.camelCase(schema.props.className)
                        )}  =(props) =>  {
                          this.state = ${renderStates1};
                          this.state = Object.assign(state, JSON.parse(JSON.stringify(props)));
                        `,
                    ];
                }

                classData = classData
                    .concat(lifeCycles)
                    .concat(methods)
                    .concat(init)
                    .concat(initClass)
                    .concat(render);
                classData.push("}");

                classes.push(classData.join("\n"));
            } else {
                let newGenerate = generateRender(schema, false);
                result += newGenerate.xml;

            }
        }

        return result;
    };

    if (option.utils) {
        Object.keys(option.utils).forEach((name) => {
            utils.push(`const ${name} = ${option.utils[name]}`);
        });
    }

// start parse schema
    transform(schema);
// flexDirection -> flex-direction
    const parseCamelToLine = (string) => {
        return string.split(/(?=[A-Z])/).join('-').toLowerCase();
    }
    let lessList = [];
// className structure support
    const generateLess = (schema, style) => {
        let less = '';

        function walk(json, parent) {
            let close = false;
            if (json.props && json.props.className) {
                let className = _.camelCase(json.props.className);
                if(_.has(json,"smart.layerProtocol.loop.type")){
                    className = json.smart.layerProtocol.loop.type;
                }
                parent = parent + ">" + className;

                if (lessList.indexOf(parent) === -1) {  //不重复则进行
                    lessList.push(parent);
                    close = true;
                    less += `.${className} {`;

                    for (let key in style[className]) {
                        less += `${parseCamelToLine(key)}: ${style[className][key]};\n`;
                    }
                }

            }
            if (json.children && json.children.length > 0 && Array.isArray(json.children)) {

                json.children.forEach(child => walk(child, parent));
            }

            if (json.props && json.props.className) {
                if (close) {
                    less += '}';
                }
            }


        }

        let parent = "";
        walk(schema, parent);

        return less;
    };
    const prettierOpt = {
        parser: "babel",
        printWidth: 120,
        singleQuote: true,
    };

    let css = `import Taro from '@tarojs/taro';
  
  export default ${toString(style)}`;

    css = css.replace(/"Taro.pxTransform\(/g, "Taro.pxTransform(");
    css = css.replace(/\)px"/g, ")");

    return {
        panelDisplay: [
            {
                panelName: `index.jsx`,
                panelValue: prettier.format(
                    `
          'use strict';

          import Taro from "@tarojs/taro";
          import React, {Component, useEffect, useState} from "react";
          import { View, Text, Image } from '@tarojs/components';
          
          ${imports.join("\n")}
          import  './index.scss';
          
          ${utils.join("\n")}
          ${classes.join("\n")}
          export default Index; 
        `,
                    prettierOpt
                ),
                panelType: "jsx",
            },
            {
                panelName: `index.scss`,
                panelValue: prettier.format(generateLess(schema, style), {parser: 'scss'}),
                panelType: "scss",
            },
        ],
        noTemplate: true,
    };
}
;
