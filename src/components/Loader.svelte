<span class="loader"></span>

<style>
	.loader {
		width: 8px;
		height: 40px;
		border-radius: 4px;
		display: block;
		margin: 40px auto;
		position: absolute;
		top:60px;
		left:50%;
		background: currentColor;
		color: #6b7280;
		box-sizing: border-box;
		animation: animloader 0.3s 0.3s linear infinite alternate;
	}

	.loader::after,
	.loader::before {
		content: "";
		width: 8px;
		height: 40px;
		border-radius: 4px;
		background: currentColor;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		left: 20px;
		box-sizing: border-box;
		animation: animloader 0.3s 0.45s linear infinite alternate;
	}
	.loader::before {
		left: -20px;
		animation-delay: 0s;
	}

	@keyframes animloader {
		0% {
			height: 30px;
		}
		100% {
			height: 2px;
		}
	}
</style>
