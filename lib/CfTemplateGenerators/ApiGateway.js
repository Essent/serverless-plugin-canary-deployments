import _ from 'lodash/fp.js'

function buildUriForAlias (functionAlias) {
  const aliasArn = [
    'arn:aws:apigateway:',
    { Ref: 'AWS::Region' },
    ':lambda:path/2015-03-31/functions/',
    { Ref: functionAlias },
    '/invocations'
  ]
  return { 'Fn::Join': ['', aliasArn] }
}

function buildV2UriForAlias (functionAlias) {
  const aliasArn = [
    'arn:',
    { Ref: 'AWS::Partition' },
    ':apigateway:',
    { Ref: 'AWS::Region' },
    ':lambda:path/2015-03-31/functions/',
    { Ref: functionAlias },
    '/invocations'
  ]
  return { 'Fn::Join': ['', aliasArn] }
}

export function replaceV2IntegrationUriWithAlias (apiGatewayMethod, functionAlias) {
  const aliasUri = buildV2UriForAlias(functionAlias)
  const newMethod = _.set('Properties.IntegrationUri', aliasUri, apiGatewayMethod)
  return newMethod
}

export function replaceMethodUriWithAlias (apiGatewayMethod, functionAlias) {
  const aliasUri = buildUriForAlias(functionAlias)
  const newMethod = _.set('Properties.Integration.Uri', aliasUri, apiGatewayMethod)
  return newMethod
}

export function replaceV2AuthorizerUriWithAlias (apiGatewayMethod, functionAlias) {
  const aliasUri = buildV2UriForAlias(functionAlias)
  const newMethod = _.set('Properties.AuthorizerUri', aliasUri, apiGatewayMethod)
  return newMethod
}
