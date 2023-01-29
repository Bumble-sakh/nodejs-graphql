import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = request.params.id;
      const post = await fastify.db.posts.findOne({ key: 'id', equals: postId });

      if (post) {
        return post;
      } else {
        throw reply.code(404);
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const dto = request.body;

      return await fastify.db.posts.create(dto);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = request.params.id;
      const post = await fastify.db.posts.findOne({ key: 'id', equals: postId });

      if (post) {
        return await fastify.db.posts.delete(postId);
      } else {
        throw reply.code(400);
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = request.params.id;
      const dto = request.body;

      const post = await fastify.db.posts.findOne({ key: 'id', equals: postId });

      if (post) {
        return await fastify.db.posts.change(postId, dto);
      } else {
        throw reply.code(400);
      }
    }
  );
};

export default plugin;
