import request from '@/utils/request'

export function listPage() {
  return request({
    url: '/address/listPage',
    method: 'get'
  })
}
