import request from '@/utils/request'
import qs from 'qs'
export function listPage(query) {
  return request({
    url: '/admin/listPage',
    method: 'get',
    params: query
  })
}

export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/admin/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}

export function add(data) {
  return request({
    url: '/admin/add',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/admin/update/' + data.id,
    method: 'post',
    data
  })
}

export function forbidden(id) {
  return request({
    url: '/admin/forbidden/' + id,
    method: 'get'
  })
}

export function del(id) {
  return request({
    url: '/admin/delete/' + id,
    method: 'get'
  })
}

export function launch(id) {
  return request({
    url: '/admin/launch/' + id,
    method: 'get'
  })
}

export function getRoles(id) {
  return request({
    url: '/admin/role/' + id,
    method: 'get'
  })
}

export function setRoles(params) {
  return request({
    url: '/admin/role/update',
    method: 'post',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    }
  })
}
