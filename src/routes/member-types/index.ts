import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<MemberTypeEntity[]> {
    return await fastify.db.memberTypes.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const memberTypeId = request.params.id;
      const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });

      if (memberType) {
        return memberType;
      } else {
        throw reply.code(404);
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const memberTypeId = request.params.id;
      const dto = request.body;

      const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });

      if (memberType) {
        return await fastify.db.memberTypes.change(memberTypeId, dto);
      } else {
        throw reply.code(400);
      }
    }
  );
};

export default plugin;
