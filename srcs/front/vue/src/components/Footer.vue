<script setup lang="ts">

interface ICreator {
	name: string;
	url: string;
}

interface ICreators {
	list: ICreator[];
}

const creators: ICreators = {
	list: [
		{
			name: "ormartin",
			url: "https://github.com/ormartin"
		},
		{
			name: "ptorger",
			url: "https://github.com/ptroger"
		},
		{
			name: "ggilbert",
			url: "https://github.com/ggilbert"
		}
	]
}

</script>

<template>
	<footer>
		<p>created by
			<span v-for="(user, index) in creators.list" :key="user.name">
				<a :href="user.url">{{ user.name }}</a>
				<span v-if="index == creators.list.length - 2"> and </span>
				<span v-else-if="index != creators.list.length - 1">, </span>
			</span>
		</p>
	</footer>
</template>

<style scoped>
footer {
  display: flex;
  flex-direction: row-reverse;
  place-items: center;
  justify-content: space-between;
  line-height: 1.5;
  max-height: 100vh;
  border-top: 1px solid;
  background: #000;
  margin-top: 30px;
  padding: 10px;
}

footer ul {
	display: flex;
	gap: 10px;
}

</style>