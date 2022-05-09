import request from '@/utils/request'

export const reqServerList = (currentPage,pageSize,q) => request({ url: `/v1/hosts/?currentPage=${currentPage}&pageSize=${pageSize}&q=${q}`, method: 'get' })