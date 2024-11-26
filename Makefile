.PHONY: all clean fclean re down restart
# .SILENT:

# **************************************************************************** #
#                                   Variable                                   #
# **************************************************************************** #

NAME	= ft_transcendence
DC		= docker compose

# **************************************************************************** #
#                                    Sources                                   #
# **************************************************************************** #

DB_DIR	= ~/goinfre/db/

# **************************************************************************** #
#                                     Rules                                    #
# **************************************************************************** #

all: $(NAME)

$(NAME): $(DB_DIR)
	npm install --prefix src/nginx/html/
	$(DC) up --build -d

down:
	$(DC) down

stop:
	$(DC) stop

restart: down all

clean:
	$(DC) down --volumes --rmi all

fclean: clean
	docker system prune --force --all;
	rm -rf src/nginx/html/node_modules

re: fclean all

$(DB_DIR):
	mkdir -p $@
