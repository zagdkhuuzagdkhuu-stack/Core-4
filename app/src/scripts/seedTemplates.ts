import database from "../database";

const SYSTEM_USER_EMAIL = "template-seed@ai-contract.local";

const commonVariables = [
  {
    key: "talA",
    label: "Тал А нэр",
    type: "text",
    required: true,
  },
  {
    key: "talB",
    label: "Тал Б нэр",
    type: "text",
    required: true,
  },
  {
    key: "ehlehOgnoo",
    label: "Эхлэх огноо",
    type: "date",
    required: true,
  },
  {
    key: "duusahOgnoo",
    label: "Дуусах огноо",
    type: "date",
    required: false,
  },
  {
    key: "tulburiinNuhtsul",
    label: "Төлбөрийн нөхцөл",
    type: "textarea",
    required: false,
  },
  {
    key: "ajliinHuree",
    label: "Ажлын хүрээ",
    type: "textarea",
    required: true,
  },
  {
    key: "dun",
    label: "Дүн",
    type: "number",
    required: false,
  },
];

const templateCategories = [
  {
    name: "Хөдөлмөрийн гэрээ",
    description: "Ажил олгогч болон ажилтны хөдөлмөрийн харилцааг зохицуулах гэрээний загварууд.",
    templates: [
      "Үндсэн хөдөлмөрийн гэрээ",
      "Туршилтын хугацаатай хөдөлмөрийн гэрээ",
      "Цагийн ажилтны хөдөлмөрийн гэрээ",
    ],
  },
  {
    name: "Нууцлалын гэрээ",
    description: "Нууц мэдээлэл хүлээн авах, ашиглах, хамгаалах үүргийг тодорхойлох гэрээний загварууд.",
    templates: [
      "Нэг талт нууцлалын гэрээ",
      "Хоёр талт нууцлалын гэрээ",
      "Ажилтны нууцлалын гэрээ",
    ],
  },
  {
    name: "Үйлчилгээ үзүүлэх гэрээ",
    description: "Үйлчилгээний хүрээ, хугацаа, төлбөр, хариуцлагыг тохиролцох гэрээний загварууд.",
    templates: [
      "Ерөнхий үйлчилгээний гэрээ",
      "IT үйлчилгээний гэрээ",
      "Зөвлөх үйлчилгээний гэрээ",
    ],
  },
  {
    name: "Худалдах, худалдан авах гэрээ",
    description: "Бараа, тоног төхөөрөмж болон төлбөрийн нөхцөлтэй худалдааны гэрээний загварууд.",
    templates: [
      "Бараа худалдах гэрээ",
      "Тоног төхөөрөмж худалдах гэрээ",
      "Урьдчилгаа төлбөртэй худалдах гэрээ",
    ],
  },
  {
    name: "Түрээсийн гэрээ",
    description: "Орон сууц, оффис, тоног төхөөрөмж түрээслүүлэх харилцааны гэрээний загварууд.",
    templates: [
      "Орон сууц түрээслэх гэрээ",
      "Оффис түрээслэх гэрээ",
      "Тоног төхөөрөмж түрээслэх гэрээ",
    ],
  },
];

function buildTemplateDescription(templateName: string, categoryName: string) {
  return `${categoryName}-ний "${templateName}" загвар. Талуудын мэдээлэл, хугацаа, төлбөрийн нөхцөл болон ажлын хүрээг бөглөж гэрээ үүсгэнэ.`;
}

function buildTemplateContent(templateName: string, categoryName: string) {
  return [
    `${templateName}`,
    "",
    "1. Ерөнхий зүйл",
    "Энэхүү гэрээг {{talA}} болон {{talB}} нар {{ehlehOgnoo}}-ны өдөр байгуулсан болно.",
    `Гэрээний төрөл: ${categoryName}.`,
    "",
    "2. Гэрээний хугацаа",
    "Гэрээ нь {{ehlehOgnoo}}-ны өдрөөс эхэлж {{duusahOgnoo}}-ны өдөр хүртэл хүчин төгөлдөр байна.",
    "",
    "3. Ажлын хүрээ",
    "{{talA}} болон {{talB}} нар дараах ажлын хүрээг харилцан тохиролцов: {{ajliinHuree}}",
    "",
    "4. Төлбөрийн нөхцөл",
    "Гэрээний нийт дүн {{dun}} байна. Төлбөрийн нөхцөл: {{tulburiinNuhtsul}}",
    "",
    "5. Талуудын эрх, үүрэг",
    "{{talA}} нь гэрээнд заасан үүргээ зохих ёсоор биелүүлэх бөгөөд {{talB}} нь тохиролцсон нөхцөлийн дагуу хамтран ажиллана.",
    "",
    "6. Хариуцлага",
    "Талууд гэрээгээр хүлээсэн үүргээ биелүүлээгүй тохиолдолд Монгол Улсын холбогдох хууль тогтоомжийн дагуу хариуцлага хүлээнэ.",
    "",
    "7. Бусад нөхцөл",
    "Гэрээнд өөрчлөлт оруулах бол талууд бичгээр харилцан тохиролцоно.",
  ].join("\n");
}

async function upsertTemplate(args: {
  name: string;
  categoryName: string;
  categoryId: string;
  createdById: string;
}) {
  const existing = await database.template.findFirst({
    where: {
      name: args.name,
      category: args.categoryName,
    },
  });

  const data = {
    name: args.name,
    description: buildTemplateDescription(args.name, args.categoryName),
    category: args.categoryName,
    content: buildTemplateContent(args.name, args.categoryName),
    variables: commonVariables,
    isActive: true,
    createdById: args.createdById,
    categoryId: args.categoryId,
  };

  if (existing) {
    await database.template.update({
      where: { id: existing.id },
      data,
    });
    return "updated";
  }

  await database.template.create({ data });
  return "created";
}

async function main() {
  const systemUser = await database.user.upsert({
    where: { email: SYSTEM_USER_EMAIL },
    update: {
      fullName: "Template Seed User",
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: SYSTEM_USER_EMAIL,
      fullName: "Template Seed User",
      role: "ADMIN",
      isActive: true,
    },
  });

  let created = 0;
  let updated = 0;

  for (const categoryData of templateCategories) {
    const category = await database.templateCategory.upsert({
      where: { name: categoryData.name },
      update: {
        description: categoryData.description,
      },
      create: {
        name: categoryData.name,
        description: categoryData.description,
      },
    });

    for (const templateName of categoryData.templates) {
      const result = await upsertTemplate({
        name: templateName,
        categoryName: category.name,
        categoryId: category.id,
        createdById: systemUser.id,
      });

      if (result === "created") created += 1;
      if (result === "updated") updated += 1;
    }
  }

  console.log(`Seeded ${templateCategories.length} template categories.`);
  console.log(`Templates created: ${created}, updated: ${updated}.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed templates:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
