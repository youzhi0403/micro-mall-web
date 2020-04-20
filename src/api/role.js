import request from '@/utils/request'

export function getList() {
  return request({
    url: '/role/getList',
    method: 'get'
  })
}
