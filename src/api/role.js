import request from '@/utils/request'
import qs from 'qs'
/* 获取所有角色，用于前端下拉列表展示*/
export function getList() {
  return request({
    url: '/role/getList',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/role/add',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/role/update/' + data.id,
    method: 'post',
    data
  })
}

export function deleteBatch(params) {
  return request({
    url: '/role/deleteBatch',
    method: 'post',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    }
  })
}

export function listPage(query) {
  return request({
    url: '/role/listPage',
    method: 'get',
    params: query
  })
}

export function getPermissions(roleId) {
  return request({
    url: '/role/permission/' + roleId,
    method: 'get'
  })
}

export function setPermissions(params) {
  return request({
    url: '/role/permission/update',
    method: 'post',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    }
  })
}
