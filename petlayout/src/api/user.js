// api/user.js
import request from '@/http/request.js'
import { customAlphabet } from 'nanoid';

//注册接口
export const register = (userData) => {
  const nanoid = customAlphabet('1234567890abcdef', 10);
  const id = nanoid();
  return request.post('/users', {
    id,
    ...userData,
    role: 'user',
    registration_time: new Date().toISOString(),
    last_login: new Date().toISOString(),
    pets: []
  })
}

