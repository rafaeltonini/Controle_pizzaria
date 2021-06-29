//Funcoes para selecionar os elementos ja que vou usar muito isso pelo projeto todo
const c = (el)=>{
    return document.querySelector(el);
};
const cs = (el)=>{
    return document.querySelectorAll(el);
};

let modalQt = 1;
let cart = [];
let modalKey = 0;

//listagem pizzas
pizzaJson.map((item,index) =>{ //item eh o objeto posicionado
    //Clonar um elemento modelo
    let pizzaItem = c('.models .pizza-item').cloneNode(true);

    //Adicionando uma chave para saber qual elemento esta selecionado
    pizzaItem.setAttribute('data-key', index);
    //Inserir informacoes no clone
    pizzaItem.querySelector('.pizza-item--img img').src = item.img;
    pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${item.price[2].toFixed(2)}`;
    pizzaItem.querySelector('.pizza-item--name').innerHTML = item.name;
    pizzaItem.querySelector('.pizza-item--desc').innerHTML = item.description;

    //Abrindo tela para adicionar ao carrinho
    pizzaItem.querySelector('a').addEventListener('click', (e)=>{
        e.preventDefault();
        //Pego o elemento que foi selecionado para conseguir as informacoes dele
        let key = e.target.closest('.pizza-item').getAttribute('data-key');
        modalQt = 1;
        modalKey = key;

        c('.pizzaBig img').src = pizzaJson[key].img;
        c('.pizzaInfo h1').innerHTML = pizzaJson[key].name;
        c('.pizzaInfo--desc').innerHTML = pizzaJson[key].description;
        c('.pizzaInfo--actualPrice').innerHTML = `R$ ${pizzaJson[key].price[2].toFixed(2)}`;
        //Limpando a classe selected para sempre abrir padrao
        c('.pizzaInfo--size.selected').classList.remove('selected');
        //loop para alimentar os gramas das pizzas em cada tamanho
        cs('.pizzaInfo--size').forEach((size, sizeIndex)=>{
            //deixar o tamanho grande como selecionado por padrao
            if (sizeIndex == 2){
                size.classList.add('selected');
            }
            size.querySelector('span').innerHTML = pizzaJson[key].sizes[sizeIndex];
        });

        //loop para selecionar o tamanho da pizza e atualizar o preco de acordo com o tamanho
        cs('.pizzaInfo--size').forEach((size, sizeIndex)=>{
            size.addEventListener('click', (e)=>{
                c('.pizzaInfo--size.selected').classList.remove('selected');
                size.classList.add('selected');
                c('.pizzaInfo--actualPrice').innerHTML = `R$ ${pizzaJson[key].price[sizeIndex].toFixed(2)}`;
            });
        });        

        c('.pizzaInfo--qt').innerHTML = modalQt;

        c('.pizzaWindowArea').style.opacity = 0;
        setTimeout(()=>{
            c('.pizzaWindowArea').style.opacity = 1;
        }, 200);
        c('.pizzaWindowArea').style.display = 'flex';
    });

    //Adicionar ao pizza-area
    c('.pizza-area').append(pizzaItem);
});

//Eventos do modal
//Fecha modal
function closeModal(){
    c('.pizzaWindowArea').style.opacity = 0;
    setTimeout(()=>{
        c('.pizzaWindowArea').style.display = 'none';
    }, 500);
}

//Adiciona funcao fechar modal em todas classes de fechar.
cs('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item)=>{
    item.addEventListener('click', closeModal);
});

//Fechar modal ao pressionar esc.
document.addEventListener('keydown', (tecla)=>{
    if( tecla.key == 'Escape'){
        closeModal();
    }
});

//Botoes + e - do modal
c('.pizzaInfo--qtmais').addEventListener('click', ()=>{
    modalQt++;
    c('.pizzaInfo--qt').innerHTML = modalQt;
});

c('.pizzaInfo--qtmenos').addEventListener('click', ()=>{
    if (modalQt > 1){
        modalQt--;
        c('.pizzaInfo--qt').innerHTML = modalQt;
    }    
});

//Funcao Botao adicionar ao carrinho.
c('.pizzaInfo--addButton').addEventListener('click', ()=>{
    //Qual pizza, tamanho e qtd.
    let size = parseInt(c('.pizzaInfo--size.selected').getAttribute('data-key'));
    let identifier = pizzaJson[modalKey].id+'@'+size;
    let key = cart.findIndex((item)=>{
        return item.identifier == identifier
    });

    if(key > -1) {
        cart[key].qt += modalQt;
    } else {
        cart.push({
            identifier,
            id:pizzaJson[modalKey].id,
            size: size,
            qt: modalQt
        });
    }
    updateCart(); //funcao que atualiza o carrrinho(array cart)
    closeModal(); //funcao que fecha o modal
});

c('.menu-openner').addEventListener('click', ()=>{
    if(cart.length > 0) {
        c('aside').style.left = '0';
    }
});

c('.menu-closer').addEventListener('click', ()=>{
    c('aside').style.left = '100vw';
});


function updateCart() {
    c('.menu-openner span').innerHTML = cart.length;

    if (cart.length > 0) {
        c('aside').classList.add('show');
        c('.cart').innerHTML = ''; //zero a lista para nao acumular sempre
        
        let subtotal = 0;
        let desconto = 0;
        let total = 0;
        //percorre todo o array do carrinho para fazer a montagem dele na tela.
        for(let i in cart) {
            let pizzaItem = pizzaJson.find((item) =>{
                return item.id == cart[i].id;
            });
            //Atualiza subtotais do carrinho
            subtotal += pizzaItem.price[cart[i].size] * cart[i].qt;
            console.log(cart[i].size);

            //Clonando estrutura do carrinho para cada item do cart
            let cartItem = c('.models .cart--item').cloneNode(true);
            let pizzaSizeName;
            switch(cart[i].size){
                case 0:
                    pizzaSizeName = 'P';
                    break;
                case 1:
                    pizzaSizeName = 'M';
                    break;
                case 2: 
                    pizzaSizeName = 'G';
                    break;
            }

            let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`;
            
            cartItem.querySelector('img').src = pizzaItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', ()=>{
                cart[i].qt++;
                updateCart();
            });
            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', ()=>{
                if (cart[i].qt > 1){
                    cart[i].qt--;
                } else {
                    cart.splice(i,1);
                }
                updateCart();
            });

            //Adicionar ao cart-area
            c('.cart').append(cartItem);
        }
        desconto = subtotal * 0.1;
        total = subtotal - desconto;

        c('.subtotal span:last-child').innerHTML = `R$${subtotal.toFixed(2)}`;
        c('.desconto span:last-child').innerHTML = `R$${desconto.toFixed(2)}`;
        c('.total span:last-child').innerHTML = `R$${total.toFixed(2)}`;

    } else {
        c('aside').classList.remove('show');
        c('aside').style.left = '100vw';
    }
}