
const petRoutes = [
  {
    path: '/pet',
    name: 'pet',
    component: () => import("../../views/Pet/index.vue"),
    meta: {
      title: "宠物"
    },
    children: [
      {
        path: '',
        name: 'mypet',
        component: () => import("../../views/Pet/components/PetCard.vue"),
        meta: {
          title: "我的宠物"
        }
      },
      {
        path: 'myadopt',
        name: 'myadopt',
        component: () => import("../../views/Adoption/Posts/AdoptionCard.vue"),
        meta: {
          title: "我的收养"
        }
      },
    ] //子路由
  },
  {
    // 宠物详情
    path: '/pet/:id',
    name: 'petDetail',
    component: () => import("../../views/Pet/components/Detail.vue"),
    meta: {
      title: "宠物详情"
    }
  },
  {
    // 创建
    path: '/createpet',
    name: 'createpet',
    component: () => import("../../views/Pet/components/CreatePet.vue"),
    meta: {
      title: "创建宠物"
    }

  }
]

export default petRoutes