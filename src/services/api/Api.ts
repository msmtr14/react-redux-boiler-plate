import { bind } from 'decko';

import {
  IUsersSearchFilters, IRepositoriesSearchFilters, IUsersSearchResults, IRepositoriesSearchResults,
} from 'shared/types/githubSearch';

import { SearchUserResponse, IDetailedServerUser, SearchRepositoriesResponse } from './types';
import { constructUsersSearchQuery, getTotalPagesFromLinkHeader, constructRepositoriesSearchQuery } from './helpers';
import { convertUser, convertUserDetails, convertRepository } from './converters';
import HttpActions from './HttpActions';

class Api {
  private actions: HttpActions;

  private headers = {
    get: {
      'Accept': 'application/vnd.github.v3+json',
    },
  };

  constructor() {
    this.actions = new HttpActions('https://api.github.com/', this.headers);
  }

  @bind
  public async searchUsers(
    searchString: string, filters: IUsersSearchFilters, page: number,
  ): Promise<IUsersSearchResults> {
    const URL = `/search/users?q=${constructUsersSearchQuery(searchString, filters, page)}`;
    const response = await this.actions.get<SearchUserResponse>(URL);
    const users = response.data.items;
    const totalPages = getTotalPagesFromLinkHeader(response.headers.link);
    return { totalPages, data: users.map(convertUser) };
  }

  @bind
  public async loadUserDetails(username: string) {
    const URL = `/users/${username}`;
    const response = await this.actions.get<IDetailedServerUser>(URL);
    return convertUserDetails(response.data);
  }

  @bind
  public async searchRepositories(
    searchString: string, options: IRepositoriesSearchFilters, page: number,
  ): Promise<IRepositoriesSearchResults> {
    const URL = `/search/repositories?q=${constructRepositoriesSearchQuery(searchString, options, page)}`;
    const response = await this.actions.get<SearchRepositoriesResponse>(URL);
    const repositories = response.data.items;
    const totalPages = getTotalPagesFromLinkHeader(response.headers.link);
    return { totalPages, data: repositories.map(convertRepository) };
  }
}

export default Api;
