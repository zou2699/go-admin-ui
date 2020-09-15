import request from '@/utils/request'

const urlPreix = '/k8s-api/apis/networking.istio.io/v1alpha3/namespaces/'

// 查询Gateway列表
export function listGateway(namespaceName) {
  return request({
    url: urlPreix + namespaceName + '/gateways',
    method: 'get'
  })
}

// 查询Gateway详细信息
export function getGateway(namespaceName, gatewayName) {
  return request({
    url: urlPreix + namespaceName + '/gateways/' + gatewayName,
    method: 'get'
  })
}

// 修改Gateway
export function ChangeGateway(namespaceName, gatewayName, data) {
  return request({
    url: urlPreix + namespaceName + '/gateways/' + gatewayName,
    method: 'put',
    data: data
  })
}

// 查询VirtualSerivce列表
export function listVirtualService(namespaceName) {
  return request({
    url: urlPreix + namespaceName + '/virtualservices',
    method: 'get'
  })
}

// 查询VirtualSerivce详细信息
export function getVirtualService(namespaceName, virtualServiceName) {
  return request({
    url: urlPreix + namespaceName + '/virtualservices/' + virtualServiceName,
    method: 'get'
  })
}

// 修改VirtualSerivce
export function ChangeVirtualService(namespaceName, virtualServiceName, data) {
  return request({
    url: urlPreix + namespaceName + '/virtualservices/' + virtualServiceName,
    method: 'put',
    data: data
  })
}

// 查询ServiceEntry列表
export function listServiceEntry(namespaceName) {
  return request({
    url: urlPreix + namespaceName + '/serviceentries',
    method: 'get'
  })
}

// 查询ServiceEntry详细信息
export function getServiceEntry(namespaceName, serviceEntryName) {
  return request({
    url: urlPreix + namespaceName + '/serviceentries/' + serviceEntryName,
    method: 'get'
  })
}

// 修改ServiceEntry
export function ChangeServiceEntry(namespaceName, serviceEntryName, data) {
  return request({
    url: urlPreix + namespaceName + '/serviceentries/' + serviceEntryName,
    method: 'put',
    data: data
  })
}

// 查询DestinationRule列表
export function listDestinationRule(namespaceName) {
  return request({
    url: urlPreix + namespaceName + '/destinationrules',
    method: 'get'
  })
}

// 查询DestinationRule详细信息
export function getDestinationRule(namespaceName, destinationRuleName) {
  return request({
    url: urlPreix + namespaceName + '/destinationrules/' + destinationRuleName,
    method: 'get'
  })
}

// 修改DestinationRule
export function ChangeDestinationRule(namespaceName, destinationRuleName, data) {
  return request({
    url: urlPreix + namespaceName + '/destinationrules/' + destinationRuleName,
    method: 'put',
    data: data
  })
}
