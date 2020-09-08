import request from '@/utils/request'

// 查询k8s namespace列表
export function listNamespace() {
  return request({
    url: '/k8s-api/api/v1/namespaces',
    method: 'get'
  })
}

// 查询Namespace列表详细信息
export function getNamespace(namespaceName) {
  return request({
    url: '/k8s-api/api/v1/namespaces/' + namespaceName,
    method: 'get'
  })
}
