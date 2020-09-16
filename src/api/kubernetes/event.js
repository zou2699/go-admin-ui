import request from '@/utils/request'

// 查询Service列表
export function listEvent(namespaceName) {
  return request({
    url: '/k8s-api/api/v1/namespaces/' + namespaceName + '/events',
    method: 'get'
  })
}
