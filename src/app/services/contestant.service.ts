import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments';
import { DeviceIdService } from './device-id.service';
import {
  ApiResponse,
  CastVotePayload,
  Contestant,
  ContestantsQueryParams,
  PaginatedData,
} from '../models/contestant.model';

@Injectable({ providedIn: 'root' })
export class ContestantService {
  private http = inject(HttpClient);
  private deviceIdService = inject(DeviceIdService);
  private readonly baseUrl = `${environment.apiUrl}api/v1/talent-hunt/contestants`;

  getContestants(params: ContestantsQueryParams = {}): Observable<PaginatedData<Contestant>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.talent) httpParams = httpParams.set('talent', params.talent);

    return this.http
      .get<ApiResponse<PaginatedData<Contestant>>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => res.data));
  }

  castVote(matricNumber: string, contestantId: string): Observable<ApiResponse<unknown>> {
    const payload: CastVotePayload = {
      matricNumber,
      contestantId,
      deviceId: this.deviceIdService.getDeviceId(),
    };
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/votes`, payload);
  }
}
