import request from '@/utils/request'

// 查询k8s-node列表
export function listNode(query) {
  return request({
    url: '/k8s-api/api/v1/nodes',
    method: 'get'
  })
}

// 查询Node详细信息
export function getNode(nodeName) {
  return request({
    url: '/k8s-api/api/v1/nodes/' + nodeName,
    method: 'get'
  })
}
