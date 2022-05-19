import request from '@/utils/request'

export const reqCDNDomainList = (diagnose) => request({ url: `/v1/cdn_list/?diagnose=${diagnose}`, method: 'get' })

export const reqRefreshCDN = (data) => request({ url: '/v1/add_cdn_task/', method: 'post', data })

export const reqCDNLog = (pageSize, currentPage, q) => request({ url: `/v1/cdn_task_list/?pageSize=${pageSize}&currentPage=${currentPage}&q=${q}`, method: 'get' })

export const reqCDNDiagnoseList = (pageSize, currentPage, q,) => request({ url: `/v1/cdn_diagnose_list/?pageSize=${pageSize}&currentPage=${currentPage}&q=${q}`, method: 'get' })

export const reqCreateDiagnose = (data) => request({ url: '/v1/add_cdn_diagnose/', method: 'post', data })