// Форматирование цены
export const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(price);
};

// Функция нормализации snake_case → camelCase
export const normalizeMaterial = (mat) => {
    const image = mat.image || mat.image_url || mat.imageUrl || '';
    const price = mat.price !== undefined ? mat.price : (mat.base_price !== undefined ? mat.base_price : mat.basePrice);
    const showImage = (mat.show_image !== undefined && mat.show_image !== null)
      ? mat.show_image
      : (mat.showImage !== undefined && mat.showImage !== null ? mat.showImage : true);

    return {
      ...mat,
      image,
      image_url: image, // Для полной совместимости с мобильной версией
      price: Number(price) || 0,
      showImage: showImage === true || showImage === 'true' || showImage === 1,
      isGlobal: mat.is_global !== undefined ? mat.is_global : mat.isGlobal,
      productUrl: mat.product_url || mat.productUrl || '',
      category_full_path: mat.category_full_path || mat.categoryFullPath || null
    };
};
