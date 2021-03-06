import request from '@/utils/request'
import qs from 'qs'
export function add(data) {
  return request({
    url: '/good/add',
    method: 'post',
    data,
    paramsSerializer: function(data) {
      return qs.stringify(data, { arrayFormat: 'repeat' })
    }
  })
}

export function del(id) {
  return request({
    url: '/good/delete/' + id,
    method: 'get'
  })
}

export function listPage(query) {
  return request({
    url: '/good/listPage',
    method: 'get',
    params: query
  })
}

export function update(data) {
  return request({
    url: '/good/update/' + data.id,
    method: 'post',
    data,
    paramsSerializer: function(data) {
      return qs.stringify(data, { arrayFormat: 'repeat' })
    }
  })
}

export function addInventory(data) {
  return request({
    url: '/good/addInventory/' + data.id,
    method: 'post',
    params: data
  })
}

export function detail(id) {
  return request({
    url: '/good/' + id,
    method: 'get'
  })
}

export function getList(data) {
  return request({
    url: 'good/getList',
    method: 'get',
    params: data
  })
}
