'use strict';

import Taro from '@tarojs/taro';
import React, { Component, useEffect, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';

import './index.scss';

const print = function(value) {
  console.log(value);
};
class TopCard extends Component {
  constructor(props) {
    super(props);
    let defaultState = {
      title: '管理物流',
      imgTrucks: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0c883770c7af11eb9d54e92da5e34759.png',
      caption: '添加物流单号',
      iconHouse: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0cb95990c7af11ebb856f54c9bc890e4.png',
      title1: '修改送货时间',
      imgFinish: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0ce34fc0c7af11eb944acf6aa4339778.png',
      caption1: '确认送达'
    };
    this.state = Object.assign(defaultState, JSON.parse(JSON.stringify(props)));
  }

  render() {
    return (
      <View className="topCard">
        <View className="block">
          <View className="container">
            <View className="titleWrapper">
              <Text className="title" lines={undefined}>
                {this.state.title}
              </Text>
            </View>
          </View>
          <View className="container1">
            <View className="containerInner">
              <View className="wrapper">
                <View className="iconCartWrapper">
                  <Image className="imgTrucks" src={this.state.imgTrucks} />
                </View>
                <Text className="caption" lines={undefined}>
                  {this.state.caption}
                </Text>
              </View>
              <View className="modifyTimeButton">
                <View className="wrapperInner">
                  <View className="group">
                    <View className="iconHouseWrapper">
                      <Image className="iconHouse" src={this.state.iconHouse} />
                    </View>
                  </View>
                  <Text className="title1" lines={undefined}>
                    {this.state.title1}
                  </Text>
                </View>
              </View>
              <View className="finishButton">
                <View className="wrapperInner1">
                  <View className="group1">
                    <Image className="imgFinish" src={this.state.imgFinish} />
                  </View>
                  <Text className="caption1" lines={undefined}>
                    {this.state.caption1}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View className="container2">
            <View className="horizontalLine5" />
          </View>
        </View>
      </View>
    );
  }
}
class LogisticsCard extends Component {
  constructor(props) {
    super(props);
    let defaultState = {
      title: '04-25',
      imgTrucks: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0c883770c7af11eb9d54e92da5e34759.png',
      caption: '添加物流单号',
      iconHouse: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0cb95990c7af11ebb856f54c9bc890e4.png',
      title1: '修改送货时间',
      imgFinish: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0ce34fc0c7af11eb944acf6aa4339778.png',
      caption1: '确认送达',
      title2: '韵达快递 4307724152986',
      icon: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0c5fa0d0c7af11eb8ba5392765d59567.png',
      dateLine: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0b108b90c7af11eba4ba8fbfdc198dc6.png',
      startIcon: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0ae758b0c7af11ebae455b68cbd70cc7.png',
      text: '装修单可以开始订货',
      lastTitle: '04-25',
      lastTime: '17:35',
      iconCheck: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0b773ca0c7af11eb841747d841cd0675.png',
      time: '14:20',
      iconSupplier: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0b9b6670c7af11eb8111477c1ee72cd1.png',
      desc: '【GE供应商】已经接到订单,并预定在2020年4月25送达',
      dateSequenceIcon: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0bc583b0c7af11eba86313a2497e2b3c.png',
      iconStart: 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/0c37f490c7af11eb9206f9195e03249f.png'
    };
    this.state = Object.assign(defaultState, JSON.parse(JSON.stringify(props)));
  }

  render() {
    return (
      <View className="logisticsCard">
        <View className="header">
          <View className="container3">
            <Text className="title2" lines={undefined}>
              {this.state.title2}
            </Text>
            <View
              className="iconCopy"
            >
              <Image className="icon" src={this.state.icon} />
            </View>
          </View>
        </View>
        <View className="body">
          <View className="logisticsInfo">
            <Image className="dateLine" src={this.state.dateLine} />
            <View className="address">
              <Image className="startIcon" src={this.state.startIcon} />
              <Text className="text" lines={undefined}>
                {this.state.text}
              </Text>
            </View>
            <View className="sign">
              <View className="lastDate">
                <Text className="lastTitle" lines={undefined}>
                  {this.state.lastTitle}
                </Text>
                <Text className="lastTime" lines={undefined}>
                  {this.state.lastTime}
                </Text>
              </View>
              <Image className="iconCheck" src={this.state.iconCheck} />
              <View className="wrapper1">
                <View className="bigStatus">
                  <Text className="text" lines={undefined}>
                    {this.state.text}
                  </Text>
                </View>
                <View className="detail">
                  <Text className="text" lines={undefined}>
                    {this.state.text}
                  </Text>
                </View>
              </View>
            </View>
            <View className="supplier">
              <View className="wrapper2">
                <View className="dateTitle">
                  <Text className="title" lines={undefined}>
                    {this.state.title}
                  </Text>
                  <Text className="time" lines={undefined}>
                    {this.state.time}
                  </Text>
                </View>
                <Image className="iconSupplier" src={this.state.iconSupplier} />
              </View>
              <View className="detail">
                <Text className="desc" lines={undefined}>
                  {this.state.desc}
                </Text>
              </View>
            </View>
            <View className="placeOrder">
              <View className="wrapperI0">
                <View className="dateTitle">
                  <Text className="title" lines={undefined}>
                    {this.state.title}
                  </Text>
                  <Text className="time" lines={undefined}>
                    {this.state.time}
                  </Text>
                </View>
                <Image className="dateSequenceIcon" src={this.state.dateSequenceIcon} />
                <View className="detail">
                  <Text className="text" lines={undefined}>
                    {this.state.text}
                  </Text>
                </View>
              </View>
              <View className="wrapperI1">
                <View className="dateTitle">
                  <Text className="title" lines={undefined}>
                    {this.state.title}
                  </Text>
                  <Text className="time" lines={undefined}>
                    {this.state.time}
                  </Text>
                </View>
                <Image className="dateSequenceIcon" src={this.state.dateSequenceIcon} />
                <View className="detail">
                  <Text className="text" lines={undefined}>
                    {this.state.text}
                  </Text>
                </View>
              </View>
              <View className="wrapperI2">
                <View className="dateTitle">
                  <Text className="title" lines={undefined}>
                    {this.state.title}
                  </Text>
                  <Text className="time" lines={undefined}>
                    {this.state.time}
                  </Text>
                </View>
                <Image className="dateSequenceIcon" src={this.state.dateSequenceIcon} />
                <View className="detail">
                  <Text className="text" lines={undefined}>
                    {this.state.text}
                  </Text>
                </View>
              </View>
            </View>
            <View className="start">
              <View className="dateTitle">
                <Text className="title" lines={undefined}>
                  {this.state.title}
                </Text>
                <Text className="time" lines={undefined}>
                  {this.state.time}
                </Text>
              </View>
              <Image className="iconStart" src={this.state.iconStart} />
              <View className="wrapper3">
                <View className="bigStatus">
                  <Text className="text" lines={undefined}>
                    {this.state.text}
                  </Text>
                </View>
                <View className="detail">
                  <Text className="text" lines={undefined}>
                    {this.state.text}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
class Index extends Component {
  constructor(props) {
    super(props);
    let defaultState = {};
    this.state = Object.assign(defaultState, JSON.parse(JSON.stringify(props)));
  }

  render() {
    return (
      <View className="page">
        <TopCard />
        <LogisticsCard />
      </View>
    );
  }
}
export default Index;
