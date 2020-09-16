import request from '@/utils/request'

// 查询k8s deployment列表
export function createResource(namespaceName, kind, data) {
  return request({
    url: '/k8s-api/namespaces/' + namespaceName + '/kind/' + kind,
    method: 'post',
    data: data
  })
}
