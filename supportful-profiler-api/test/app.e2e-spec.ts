import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { testDatabaseConfig } from '../src/config/test.config';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let profileId: string;
  let clientId: string;
  let assignmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Profiles', () => {
    const createProfileDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      skills: ['JavaScript', 'TypeScript'],
      summary: 'Experienced developer',
      yearsOfExperience: 5,
    };

    it('/profiles (POST)', () => {
      return request(app.getHttpServer())
        .post('/profiles')
        .send(createProfileDto)
        .expect(201)
        .expect(res => {
          expect(res.body.id).toBeDefined();
          expect(res.body.firstName).toBe(createProfileDto.firstName);
          profileId = res.body.id;
        });
    });

    it('/profiles (GET)', () => {
      return request(app.getHttpServer())
        .get('/profiles')
        .query({ take: 10, skip: 0 })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].id).toBeDefined();
        });
    });

    it('/profiles/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/profiles/${profileId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(profileId);
        });
    });
  });

  describe('Clients', () => {
    const createClientDto = {
      companyName: 'Acme Corp',
      industry: 'Technology',
      primaryContactName: 'Jane Smith',
      primaryContactEmail: 'jane.smith@acme.com',
    };

    it('/clients (POST)', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send(createClientDto)
        .expect(201)
        .expect(res => {
          expect(res.body.id).toBeDefined();
          expect(res.body.companyName).toBe(createClientDto.companyName);
          clientId = res.body.id;
        });
    });

    it('/clients (GET)', () => {
      return request(app.getHttpServer())
        .get('/clients')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body[0])).toBe(true);
          expect(typeof res.body[1]).toBe('number');
        });
    });

    it('/clients/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/clients/${clientId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(clientId);
        });
    });
  });

  describe('Assignments', () => {
    const createAssignmentDto = {
      profileId: '',
      clientId: '',
      startDate: new Date(),
      status: 'pending',
      rate: 100,
    };

    beforeAll(() => {
      createAssignmentDto.profileId = profileId;
      createAssignmentDto.clientId = clientId;
    });

    it('/assignments (POST)', () => {
      return request(app.getHttpServer())
        .post('/assignments')
        .send(createAssignmentDto)
        .expect(201)
        .expect(res => {
          expect(res.body.id).toBeDefined();
          expect(res.body.profile.id).toBe(profileId);
          expect(res.body.client.id).toBe(clientId);
          assignmentId = res.body.id;
        });
    });

    it('/assignments (GET)', () => {
      return request(app.getHttpServer())
        .get('/assignments')
        .query({ take: 10, skip: 0 })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].id).toBeDefined();
        });
    });

    it('/assignments/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/assignments/${assignmentId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(assignmentId);
        });
    });

    it('/assignments/profile/:profileId (GET)', () => {
      return request(app.getHttpServer())
        .get(`/assignments/profile/${profileId}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].profile.id).toBe(profileId);
        });
    });

    it('/assignments/client/:clientId (GET)', () => {
      return request(app.getHttpServer())
        .get(`/assignments/client/${clientId}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].client.id).toBe(clientId);
        });
    });
  });
});
