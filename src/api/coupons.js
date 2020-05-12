import request from '@/utils/request'

export function add(data) {
  return request({
    url: '/coupons/add',
    method: 'post',
    data
  })
}

export function listPage(query) {
  return request({
    url: '/coupons/listPage',
    method: 'get',
    params: query
  })
}

export function del(id) {
  return request({
    url: '/coupons/delete/' + id,
    method: 'get'
  })
}
