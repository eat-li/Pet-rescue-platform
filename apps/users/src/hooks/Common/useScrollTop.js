const scrollToTop = (Container) => {
  if (Container.value) {
    // 平滑滚动到顶部
    Container.value.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

export default scrollToTop