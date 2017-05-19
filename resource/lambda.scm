(let ([f (lambda (a) (+ a 1))])
	(let ([g (lambda (a) (* a 2))])
		(g (f 2))))