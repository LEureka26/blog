import api from './axios'

export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getUser: () => api.get('/user'),
  updateUser: (data) => api.put('/user', data),
  getUserStats: () => api.get('/user/stats')
}

export const articleAPI = {
  getArticles: (params) => api.get('/articles', { params }),
  getArticle: (id) => api.get(`/articles/${id}`),
  createArticle: (data) => api.post('/articles', data),
  updateArticle: (id, data) => api.put(`/articles/${id}`, data),
  deleteArticle: (id, data) => api.delete(`/articles/${id}`, { data }),
  searchArticles: (search) => api.get(`/articles/search=${search}`)
}

export const categoryAPI = {
  getCategories: () => api.get('/categories')
}

export default api