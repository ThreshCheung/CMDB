import request from '@/utils/request'

export const reqSshList = (p)=> request({url:`/v1/projects/?p=${p}`,method:'get'})

export const reqWsId = (data)=> request({url:'../ssh',method:'post',data})