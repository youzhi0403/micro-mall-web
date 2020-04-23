import request from '@/utils/request'
import qs from 'qs'

export function treeList() {
  return request({
    url: '/permission/treeList',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/permission/add',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: 'permission/update/' + data.id,
    method: 'post',
    data
  })
}

export function deleteBatch(params) {
  return request({
    url: '/permission/deleteBatch',
    method: 'post',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    }
  })
}

export function listPage(query) {
  return request({
    url: '/permission/listPage',
    method: 'get',
    params: query
  })
}

export function detail(id) {
  return request({
    url: '/permission/' + id,
    method: 'get'
  })
}
