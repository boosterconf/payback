export type User = {
	id: string;
	name: string;
	avatar: string;
	fikenContactId: number;
};

export type RelatedToOption = {
	id: number;
	name: string;
	projectId: number;
};

export type ExpenseType = {
	id: number;
	name: string;
	incomeAccount: string;
	descriptionPrefix: string;
};

export type Env = {
	Variables: {
		user: User;
	};
};

export type SlackTokenResponse = {
	ok?: boolean;
	id_token?: string;
	error?: string;
};

export type SlackIdTokenPayload = {
	sub: string;
	name?: string;
	picture?: string;
	email?: string;
	nonce?: string;
};
