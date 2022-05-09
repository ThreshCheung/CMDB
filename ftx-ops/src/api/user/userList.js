import request from '@/utils/request'

export const reqUserList = ()=> request({url:`/v1/menu/`,method:'get'})