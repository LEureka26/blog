import api from './axios'

export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getUser: () => api.get('/user')
}

export const articleAPI = {
  getArticles: (params) => api.get('/articles', { params }),
  getArticle: (id) => api.get(`/articles/${id}`),
  createArticle: (data) => api.post('/articles', data),
  searchArticles: (search) => api.get(`/articles/search=${search}`)
}

export const categoryAPI = {
  getCategories: () => api.get('/categories')
}

export default api