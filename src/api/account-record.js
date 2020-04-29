import request from '@/utils/request'

export function listPage(query) {
  return request({
    url: '/accountRecord/listPage',
    method: 'get',
    params: query
  })
}
