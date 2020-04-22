import request from '@/utils/request'
import qs from 'qs'

export function treeList() {
  return request({
    url: '/permission/treeList',
    method: 'get'
  })
}

export function add(params) {
  return request({
    url: '/permission/add',
    method: 'post',
    params
  })
}

export function update(params) {
  return request({
    url: 'permission/update/' + params.id,
    method: 'post',
    params
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
