import request from '@/utils/request'

// 查询Service列表
export function listService(namespaceName) {
  return request({
    url: '/k8s-api/api/v1/namespaces/' + namespaceName + '/services',
    method: 'get'
  })
}

// 查询Service详细信息
export function getService(namespaceName, serviceName) {
  return request({
    url: '/k8s-api/api/v1/namespaces/' + namespaceName + '/services/' + serviceName,
    method: 'get'
  })
}
