import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    return await fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileId = request.params.id;
      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId });

      if (profile) {
        return profile;
      } else {
        throw reply.code(404);
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const dto = request.body;
      const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: dto.memberTypeId });
      const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: dto.userId });

      if (memberType && !profile) {
        return await fastify.db.profiles.create(dto);
      } else {
        throw reply.code(400);
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileId = request.params.id;
      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId });

      if (profile) {
        return await fastify.db.profiles.delete(profileId);
      } else {
        throw reply.code(400);
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileId = request.params.id;
      const dto = request.body;

      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId });

      if (profile) {
        return await fastify.db.profiles.change(profileId, dto);
      } else {
        throw reply.code(400);
      }
    }
  );
};

export default plugin;
