import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createUserBodySchema, changeUserBodySchema, subscribeBodySchema } from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return await fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;

      const user = await fastify.db.users.findOne({ key: 'id', equals: userId });

      if (user !== null) {
        return user;
      } else {
        throw reply.code(404);
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const dto = request.body;

      return await fastify.db.users.create(dto);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const user = await fastify.db.users.findOne({ key: 'id', equals: userId });

      if (user) {
        const targetUsers = await fastify.db.users.findMany();

        for await (const targetUser of targetUsers) {
          const { subscribedToUserIds } = targetUser;
          const index = subscribedToUserIds.indexOf(userId);

          if (index !== -1) {
            subscribedToUserIds.splice(index, 1);
            await fastify.db.users.change(targetUser.id, { subscribedToUserIds });
          }
        }
        //TODO: delete posts, profile

        return await fastify.db.users.delete(userId);
      } else {
        throw reply.code(400);
      }
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const targetId = request.body.userId;
      const targetUser = await fastify.db.users.findOne({ key: 'id', equals: targetId });

      if (targetUser) {
        const { subscribedToUserIds } = targetUser;
        subscribedToUserIds.push(userId);

        return await fastify.db.users.change(targetId, { subscribedToUserIds });
      } else {
        throw reply.code(400);
      }
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const targetId = request.body.userId;
      const targetUser = await fastify.db.users.findOne({ key: 'id', equals: targetId });

      if (targetUser) {
        const { subscribedToUserIds } = targetUser;
        const index = subscribedToUserIds.indexOf(userId);
        if (index !== -1) {
          subscribedToUserIds.splice(index, 1);
          return await fastify.db.users.change(targetId, { subscribedToUserIds });
        } else {
          throw reply.code(400);
        }
      } else {
        throw reply.code(400);
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const dto = request.body;

      const user = await fastify.db.users.findOne({ key: 'id', equals: userId });

      if (user) {
        return await fastify.db.users.change(userId, dto);
      } else {
        throw reply.code(400);
      }
    }
  );
};

export default plugin;
