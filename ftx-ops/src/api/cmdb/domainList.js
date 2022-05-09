import request from '@/utils/request'

export const reqDomainList = () => request({ url: `/v1/domain/`, method: 'get' })

export const reqRecordList = (currentPage,pageSize,domainId,rr,value) => request({ url: `/v1/record/?currentPage=${currentPage}&pageSize=${pageSize}&domainId=${domainId}&rr=${rr}&value=${value}`, method: 'get' })

export const reqEditRecord = (data)=>request({url:'/v1/record_edit/',method:'patch',data})

export const reqAddRecord = (data)=>request({url:'/v1/record_edit/',method:'post',data})

export const reqDeleteRecord = (data)=>request({url:'/v1/record_delete/',method:'post',data})