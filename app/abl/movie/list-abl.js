const MovieDto = require("../../components/dto/movie-dto");
const { DefaultValueMap } = require("../../constants/movie-constants");

class ListAbl {
  constructor(movieDao) {
    this.movieDao = movieDao;
  }

  async list(dtoIn) {
    // List movies
    const { itemList, total } = await this.movieDao.list(MovieDto.prepareListDtoIn(dtoIn));

    // Return movie list
    return { data: itemList, meta: { total, pageSize: dtoIn.limit || DefaultValueMap.LIMIT }, status: 1 };
  }
}

module.exports = ListAbl;