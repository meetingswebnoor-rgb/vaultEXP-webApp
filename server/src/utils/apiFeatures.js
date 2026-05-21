/**
 * Mobile-Ready API Features & Pagination Utility
 */

class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Prisma query object, e.g. prisma.business.findMany
    this.queryString = queryString; // req.query
    this.prismaArgs = {};
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'cursor'];
    excludedFields.forEach((el) => delete queryObj[el]);

    if (Object.keys(queryObj).length > 0) {
      this.prismaArgs.where = { ...this.prismaArgs.where, ...queryObj };
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map(field => {
        if (field.startsWith('-')) return { [field.substring(1)]: 'desc' };
        return { [field]: 'asc' };
      });
      this.prismaArgs.orderBy = sortBy;
    } else {
      // Default sort for mobile pagination
      this.prismaArgs.orderBy = { createdAt: 'desc' };
    }
    return this;
  }

  paginate() {
    const limit = parseInt(this.queryString.limit, 10) || 20;
    
    if (this.queryString.cursor) {
      // Cursor-based pagination (best for mobile/infinite scroll)
      this.prismaArgs.take = limit;
      this.prismaArgs.skip = 1; // Skip the cursor
      this.prismaArgs.cursor = { id: this.queryString.cursor };
    } else {
      // Offset-based pagination (fallback)
      const page = parseInt(this.queryString.page, 10) || 1;
      const skip = (page - 1) * limit;
      this.prismaArgs.take = limit;
      this.prismaArgs.skip = skip;
    }

    return this;
  }

  getArgs() {
    return this.prismaArgs;
  }
}

module.exports = APIFeatures;
