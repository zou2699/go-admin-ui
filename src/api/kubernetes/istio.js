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

// 查询VirtualSerivce列表
export function listVirtualSerivce(namespaceName) {
  return request({
    url: urlPreix + namespaceName + '/virtuaservices',
    method: 'get'
  })
}

// 查询VirtualSerivce详细信息
export function getVirtuaService(namespaceName, virtuaServiceName) {
  return request({
    url: urlPreix + namespaceName + '/virtuaservices/' + virtuaServiceName,
    method: 'get'
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
