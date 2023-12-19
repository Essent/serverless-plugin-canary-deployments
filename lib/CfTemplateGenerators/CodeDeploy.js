/* eslint-disable no-template-curly-in-string */

import _ from 'lodash/fp.js'

export function buildApplication () {
  return {
    Type: 'AWS::CodeDeploy::Application',
    Properties: { ComputePlatform: 'Lambda' }
  }
}

export function buildFnDeploymentGroup ({ codeDeployAppName, codeDeployGroupName, codeDeployRoleArn, deploymentSettings = {} }) {
  const deploymentGroup = {
    Type: 'AWS::CodeDeploy::DeploymentGroup',
    Properties: {
      ApplicationName: {
        Ref: codeDeployAppName
      },
      AutoRollbackConfiguration: {
        Enabled: true,
        Events: [
          'DEPLOYMENT_FAILURE',
          'DEPLOYMENT_STOP_ON_ALARM',
          'DEPLOYMENT_STOP_ON_REQUEST'
        ]
      },
      DeploymentGroupName: codeDeployGroupName,
      DeploymentConfigName: {
        'Fn::Sub': [
          'CodeDeployDefault.Lambda${ConfigName}',
          { ConfigName: deploymentSettings.type }
        ]
      },
      DeploymentStyle: {
        DeploymentType: 'BLUE_GREEN',
        DeploymentOption: 'WITH_TRAFFIC_CONTROL'
      }
    }
  }
  const lookupRole = { 'Fn::GetAtt': ['CodeDeployServiceRole', 'Arn'] }
  const roleArn = codeDeployRoleArn || lookupRole
  Object.assign(deploymentGroup.Properties, { ServiceRoleArn: roleArn })
  if (deploymentSettings.alarms) {
    const alarmNames = deploymentSettings.alarms.map(a => {
      const name = _.propOr({ Ref: a }, 'name', a)
      return { Name: name }
    })
    const alarmConfig = {
      Alarms: alarmNames,
      Enabled: true
    }
    Object.assign(deploymentGroup.Properties, { AlarmConfiguration: alarmConfig })
  }
  if (deploymentSettings.triggerConfigurations) {
    Object.assign(deploymentGroup.Properties, { TriggerConfigurations: deploymentSettings.triggerConfigurations })
  }
  return deploymentGroup
}
