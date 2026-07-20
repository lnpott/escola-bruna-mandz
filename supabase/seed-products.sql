insert into public.products (id, name, description, price, stock, active, category, badge, badge_color, image, variants)
values
    ('pulseira', 'Pulseira Bruna Mandz', 'Pulseira exclusiva com identidade Bruna Mandz.', 19.90, 80, true, 'acessorios', 'Novidade', 'purple', '/merch/Pulseira.png', '[]'::jsonb),
    ('palheta', 'Palheta Personalizada', 'Palheta personalizada com a logo Bruna Mandz.', 9.90, 150, true, 'acessorios', null, null, '/merch/Paleta.png', '[]'::jsonb),
    ('chaveiro', 'Chaveiro Bruna Mandz', 'Chaveiro com arte exclusiva da escola.', 14.90, 100, true, 'acessorios', null, null, '/merch/Chaveiro.png', '[]'::jsonb),
    ('copo-termico', 'Copo Térmico Bruna Mandz', 'Copo térmico com logo da escola.', 59.90, 30, true, 'acessorios', 'Limitado', 'orange', '/merch/Copo.png', '[]'::jsonb),
    ('camisa-classica', 'Camisa Clássica', 'A camisa oficial da escola.', 69.90, 50, true, 'roupas', 'Promoção', 'green', '/merch/TSHIRT_PREMIUN.png', '[{"sizes":["P","M","G","GG"]}]'::jsonb),
    ('camisa-minimalista', 'Camisa Minimalista', 'Design limpo e moderno.', 69.90, 50, true, 'roupas', null, null, '/merch/TSHIRT_PRO.png', '[{"sizes":["P","M","G","GG"]}]'::jsonb),
    ('camisa-rock', 'Camisa Rock', 'Para os que vivem o rock.', 69.90, 50, true, 'roupas', 'Novidade', 'purple', '/merch/TSHIRT_ROCK.png', '[{"sizes":["P","M","G","GG"]}]'::jsonb),
    ('camisa-nposso', 'Camisa "Não Posso, Tenho Ensaio"', 'Camisa com estampa clássica "Não Posso, Tenho Ensaio". Perfeita para ensaios e para o dia a dia.', 69.90, 50, true, 'roupas', 'Novidade', 'purple', '/products/NPOSSO.jpeg', '[{"sizes":["P","M","G","GG"]}]'::jsonb),
    ('camisa-padrao', 'Camisa Oficial Padrão', 'A camisa oficial com design premium da escola Bruna Mandz.', 69.90, 50, true, 'roupas', 'Promoção', 'green', '/products/PADRAO.jpeg', '[{"sizes":["P","M","G","GG"]}]'::jsonb),
    ('suporte-baqueta', 'Suporte de Baqueta', 'Suporte organizador de baquetas para bateria. Prático e resistente.', 49.90, 30, true, 'acessorios', 'Limitado', 'orange', '/products/baqueta.png', '[]'::jsonb)
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
    variants = excluded.variants;
