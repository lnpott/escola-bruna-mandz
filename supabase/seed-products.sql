insert into public.products (id, name, description, price, stock, active, category, badge, badge_color, image, reward_xp, variants)
values
    ('camisa-nposso', 'Camisa "Não Posso, Tenho Ensaio"', 'Camisa com estampa clássica "Não Posso, Tenho Ensaio". Perfeita para ensaios e para o dia a dia.', 69.90, 50, true, 'roupas', 'Novidade', 'purple', '/products/NPOSSO.jpeg', 70, '[{"sizes":["P","M","G","GG"]}]'::jsonb),
    ('camisa-padrao', 'Camisa Oficial Padrão', 'A camisa oficial com design premium da escola Bruna Mandz.', 69.90, 50, true, 'roupas', 'Promoção', 'green', '/products/PADRAO.jpeg', 70, '[{"sizes":["P","M","G","GG"]}]'::jsonb),
    ('suporte-baqueta', 'Suporte de Baqueta', 'Suporte organizador de baquetas para bateria. Prático e resistente.', 49.90, 30, true, 'acessorios', 'Limitado', 'orange', '/products/baqueta.png', 50, '[]'::jsonb)
on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    stock = excluded.stock,
    active = excluded.active,
    category = excluded.category,
    badge = excluded.badge,
    badge_color = excluded.badge_color,
    image = excluded.image,
    reward_xp = excluded.reward_xp,
    variants = excluded.variants;
