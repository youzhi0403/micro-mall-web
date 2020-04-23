import request from '@/utils/request'

export function add(data) {
  return request({
    url: '/classification/add',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: '/classification/delete/' + id,
    method: 'get'
  })
}

export function listPage(query) {
  return request({
    url: '/classification/listPage',
    method: 'get',
    params: query
  })
}

export function update(data) {
  return request({
    url: '/classification/update/' + data.id,
    method: 'post',
    data
  })
}

export function treeList(kind) {
  return request({
    url: '/classification/treeList/' + kind,
    method: 'get'
  })
}

export function detail(id) {
  return request({
    url: '/classification/' + id,
    method: 'get'
  })
}
