import { TestBed } from '@angular/core/testing';

import { ChatInRoomService } from './chat-in-room.service';

describe('ChatInRoomService', () => {
  let service: ChatInRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatInRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
