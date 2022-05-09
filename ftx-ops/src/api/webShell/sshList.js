import request from '@/utils/request'

export const reqSshList = (p)=> request({url:`/v1/projects/?p=${p}`,method:'get'})

export const reqWsId = (host_id)=> request({url:`../ssh?host_id=${host_id}`,method:'post'})