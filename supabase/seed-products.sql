insert into public.products (id, name, description, price, stock, active, category, badge, badge_color, image, reward_xp, variants)
values
    ('pulseira','Pulseira Bruna Mandz','Pulseira exclusiva com identidade Bruna Mandz.',19.90,80,true,'acessorios','Novidade','green','/Pulseira.png',20,'[]'::jsonb),
    ('palheta','Palheta Personalizada','Palheta personalizada com a logo Bruna Mandz.',9.90,150,true,'acessorios',null,null,'/Paleta.png',10,'[]'::jsonb),
    ('chaveiro','Chaveiro Bruna Mandz','Chaveiro com arte exclusiva da escola.',14.90,100,true,'acessorios',null,null,'/Chaveiro.png',15,'[]'::jsonb),
    ('copo-termico','Copo Térmico Bruna Mandz','Copo térmico com logo da escola.',59.90,30,true,'acessorios','Premium','yellow','/Copo.png',60,'[]'::jsonb),
    ('camisa-classica','Camisa Clássica','A camisa oficial da escola.',69.90,50,true,'roupas','Mais Vendida','red','/TSHIRT_PREMIUN.png',70,'[{"sizes":["P","M","G","GG"]}]'::jsonb),
    ('camisa-minimalista','Camisa Minimalista','Design limpo e moderno.',69.90,50,true,'roupas',null,null,'/TSHIRT_PRO.png',70,'[{"sizes":["P","M","G","GG"]}]'::jsonb),
    ('camisa-rock','Camisa Rock','Para os que vivem o rock.',69.90,50,true,'roupas','Exclusiva','purple','/TSHIRT_ROCK.png',70,'[{"sizes":["P","M","G","GG"]}]'::jsonb)
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
