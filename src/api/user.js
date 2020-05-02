import request from '@/utils/request'
export function listPage(query) {
  return request({
    url: '/user/listPage',
    method: 'get',
    params: query
  })
}

export function add(data) {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: '/user/delete/' + id,
    method: 'get'
  })
}

export function forbidden(id) {
  return request({
    url: '/user/forbidden/' + id,
    method: 'get'
  })
}

export function launch(id) {
  return request({
    url: '/user/launch/' + id,
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: '/user/update/' + data.id,
    method: 'post',
    data
  })
}
